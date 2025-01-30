export type OpenAPIDocument = {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
    contact?: {
      email?: string;
      url?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
    'x-logo'?: {
      url: string;
      altText?: string;
    };
  };
  servers: Array<{ url: string }>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    parameters?: Record<string, Parameter>;
    responses?: Record<string, ResponseObject>;
    securitySchemes?: Record<string, SecurityScheme>;
    examples?: Record<string, any>;
  };
  tags?: Array<{
    name: string;
    description?: string;
    'x-displayName'?: string;
  }>;
  'x-tagGroups'?: Array<{
    name: string;
    tags: string[];
  }>;
  security?: Array<Record<string, any>>;
};

export type PathItem = Record<string, Operation>;

export type Operation = {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Array<Parameter | ReferenceObject>;
  responses?: Record<string, ResponseObject | ReferenceObject>;
  requestBody?: RequestBody;
  security?: Array<Record<string, any>>;
  'x-badges'?: Array<{
    name: string;
    position?: string;
    color?: string;
  }>;
};

export type SchemaObject = {
  type?: string;
  description?: string;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  items?: SchemaObject | ReferenceObject;
  required?: string[];
  enum?: any[];
  example?: any;
  format?: string;
  pattern?: string;
};

export type Parameter = {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  schema: SchemaObject;
};

export type ResponseObject = {
  description: string;
  content?: Record<string, {
    schema?: SchemaObject | ReferenceObject;
    examples?: Record<string, {
      summary?: string;
      value?: any;
    }>;
  }>;
};

export type RequestBody = {
  required?: boolean;
  content: Record<string, {
    schema: SchemaObject | ReferenceObject;
    examples?: Record<string, {
      summary?: string;
      value?: any;
    }>;
  }>;
};

export type ReferenceObject = {
  $ref: string;
};

export type SecurityScheme = {
  type: string;
  scheme?: string;
};