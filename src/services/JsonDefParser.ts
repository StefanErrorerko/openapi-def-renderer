import * as Types from '../types/types';
import * as yaml from 'js-yaml'

export class OpenAPIDefinition {
    private readonly spec: any;
    readonly version: '3.0' | '3.1';
  
    constructor(rawSpec: any) {
      this.spec = rawSpec;
      this.version = this.detectVersion(rawSpec);
    }
  
    private detectVersion(spec: any):  '3.0' | '3.1' {
      if (spec.openapi?.startsWith('3.0.')) return '3.0';
      if (spec.openapi?.startsWith('3.1.')) return '3.1';
      throw new Error('Unsupported OpenAPI version');
    }
  
    get paths(): Record<string, Types.PathItem> {
      return this.spec.paths || {};
    }
  
    get servers(): { url: string; description?: string }[] {
      return this.spec.servers || [{ url: '/' }];
    }
  
    getPath(path: string): Types.PathItem | undefined {
      return this.paths[path];
    }
  
    getOperation(path: string, method: string): Types.Operation | undefined {
      const pathItem = this.getPath(path);
      return pathItem?.[method.toLowerCase() as keyof Types.PathItem] as Types.Operation;
    }
  
    getParameters(path: string, method: string): Types.Parameter[] {
      const pathItem = this.getPath(path);
      const operation = this.getOperation(path, method);
      
      const pathParams = (pathItem?.parameters || []) as Types.Parameter[];
      const operationParams = (operation?.parameters || []) as Types.Parameter[];
      
      return [...pathParams, ...operationParams];
    }
  
    getSchema(ref: string): Types.SchemaObject | undefined {
      if (!ref.startsWith('#/')) return undefined;
      
      const path = ref.substring(2).split('/');
      let current: any = this.spec;
      
      for (const segment of path) {
        current = current[segment];
        if (!current) return undefined;
      }
      
      return current;
    }
  
    getAllEndpoints(): { path: string; method: string; operation: Types.Operation }[] {
      const endpoints: { path: string; method: string; operation: Types.Operation }[] = [];
      
      Object.entries(this.paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (method !== 'parameters' && typeof operation === 'object') {
            endpoints.push({
              path,
              method: method.toUpperCase(),
              operation: operation as Types.Operation
            });
          }
        });
      });
      
      return endpoints;
    }
}

export const parse = (content: string, format: string): Types.OpenAPIDocument => {
  let parsed;
  try {
    if (format === 'json') {
      parsed = JSON.parse(content);
    } else {
      parsed = yaml.load(content);
    }
    
    const definition = new OpenAPIDefinition(parsed);
    
    return {
      openapi: parsed.openapi,
      info: parsed.info,
      servers: definition.servers,
      paths: definition.paths,
      components: parsed.components,
      tags: parsed.tags,
      'x-tagGroups': parsed['x-tagGroups'],
      security: parsed.security
    };
  } catch (error) {
    throw new Error(`Failed to parse OpenAPI definition: ${error}`);
  }
};