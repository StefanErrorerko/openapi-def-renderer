import * as React from 'react'
import { OpenAPIDocument, PathItem } from '../types/types';

export default class RefResolver {
    private readonly rootDocument: any;
    private resolvedRefs: Map<string, any> = new Map();
    private resolutionStack: string[] = [];
    private MAX_DEPTH = 50; 
  
    constructor(rootDocument: any) {
      this.rootDocument = rootDocument;
    }
  
    resolve(refString: string): PathItem {
      // circular dependencies
      if (this.resolutionStack.includes(refString)) {
        const circle = [...this.resolutionStack, refString].join(' -> ');
        throw new Error(`Circular reference detected: ${circle}`);
      }
  
      // resolution depth
      if (this.resolutionStack.length > this.MAX_DEPTH) {
        throw new Error('Maximum reference resolution depth exceeded');
      }
  
      // cache
      if (this.resolvedRefs.has(refString)) {
        return this.resolvedRefs.get(refString);
      }
  
      const { documentPath, pointer } = this.parseRef(refString);
  
      try {
        // Push to resolution stack
        this.resolutionStack.push(refString);
  
        // Get the raw value
        const rawValue = this.resolvePointer(this.rootDocument, pointer);
  
        // Recursively resolve any nested references
        const resolvedValue = this.resolveNestedRefs(rawValue);
  
        // Cache the result
        this.resolvedRefs.set(refString, resolvedValue);
  
        return resolvedValue;
      } finally {
        // Always pop from stack, even if error occurs
        this.resolutionStack.pop();
      }
    }
  
    private parseRef(refString: string): { documentPath: string | null; pointer: string } {
      // if only internal references for now
      if (!refString.startsWith('#/')) {
        throw new Error('Only internal references are supported');
      }
  
      return {
        documentPath: null,
        pointer: refString.substring(2)
      };
    }
  
    private resolvePointer(document: any, pointer: string): any {
      const segments = pointer.split('/');
      let current = document;
  
      for (const segment of segments) {
        const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
        
        if (current === undefined) {
          throw new Error(`Unable to resolve pointer: ${pointer}`);
        }
  
        current = current[key];
      }
  
      return current;
    }
  
    private resolveNestedRefs(value: any): any {
      if (!value || typeof value !== 'object') {
        return value;
      }
  
      if (Array.isArray(value)) {
        return value.map(item => this.resolveNestedRefs(item));
      }
  
      if (value.$ref && typeof value.$ref === 'string') {
        const resolved = this.resolve(value.$ref);
        const { $ref, ...rest } = value;
        return { ...resolved, ...rest };
      }
  
      const resolved: any = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = this.resolveNestedRefs(val);
      }
  
      return resolved;
    }
  }
  
  // Example usage:
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        BaseEntity: {
          type: "object",
          properties: {
            id: { type: "integer" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        Pet: {
          allOf: [
            { $ref: "#/components/schemas/BaseEntity" },
            {
              type: "object",
              properties: {
                name: { type: "string" },
                tag: { $ref: "#/components/schemas/Tag" }
              }
            }
          ]
        },
        Tag: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" }
          }
        }
      }
    }
  };
  
  const resolver = new RefResolver(spec);
  const resolvedPetSchema = resolver.resolve('#/components/schemas/Pet');