import React from 'react';
import { Operation, ReferenceObject, SchemaObject, RequestBody, ResponseObject } from '../types/types';
import RefResolver from './RefResolver';

interface PathProps {
  path: string;
  method: string;
  operation: Operation;
  resolver: RefResolver;
}

interface MediaTypeObject {
  schema?: SchemaObject | ReferenceObject;
  example?: any;
  examples?: Record<string, any>;
}

const Path: React.FC<PathProps> = ({ path, method, operation, resolver }) => {
  const resolveIfReference = (value: any): any => {
    if (!value) return value;
    if ('$ref' in value) {
      const resolved = resolver.resolve(value.$ref);
      // Recursively resolve any nested refs in the resolved value
      return resolveDeepRefs(resolved);
    }
    return value;
  };

  const resolveDeepRefs = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => resolveDeepRefs(item));
    }

    if ('$ref' in obj) {
      return resolveIfReference(obj);
    }

    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        resolved[key] = resolveDeepRefs(value);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  };

  const resolvedOperation = {
    ...operation,
    parameters: operation.parameters?.map(param => {
      const resolvedParam = resolveIfReference(param);
      if (resolvedParam.schema) {
        resolvedParam.schema = resolveDeepRefs(resolvedParam.schema);
      }
      return resolvedParam;
    }),
    requestBody: operation.requestBody && {
      ...resolveIfReference(operation.requestBody),
      content: Object.entries(resolveIfReference(operation.requestBody).content).reduce((acc, [type, content]) => ({
        ...acc,
        [type]: {
          ...content as MediaTypeObject,
          schema: resolveDeepRefs((content as MediaTypeObject).schema)
        }
      }), {})
    } as RequestBody,
    responses: operation.responses && Object.entries(operation.responses).reduce((acc, [code, response]) => {
      const resolvedResponse = resolveIfReference(response);
      return {
        ...acc,
        [code]: {
          ...resolvedResponse,
          content: resolvedResponse.content && Object.entries(resolvedResponse.content).reduce((contentAcc, [type, content]) => ({
            ...contentAcc,
            [type]: {
              ...content as MediaTypeObject,
              schema: resolveDeepRefs((content as MediaTypeObject).schema)
            }
          }), {})
        }
      };
    }, {} as Record<string, ResponseObject>)
  };

  const getResponseCodeClass = (code: string) => {
    if (code.startsWith('2')) return 'success';
    if (code.startsWith('4')) return 'warning';
    if (code.startsWith('5')) return 'error';
    return '';
  };

  return (
    <div className="main-path-content">
      {/* Header */}
      {resolvedOperation.summary && (
        <h1 className="text-2xl font-bold mb-4">{resolvedOperation.summary}</h1>
      )}

      <div className="flex items-center gap-3 mb-6">
        <span className={`method-badge method-${method}`}>
          {method.toUpperCase()}
        </span>
      </div>

      {resolvedOperation.description && (
        <p className="text-gray-600 mb-8">{resolvedOperation.description}</p>
      )}

      {/* Tags */}
      {resolvedOperation.tags && resolvedOperation.tags.length > 0 && (
        <div className="content-block">
          <h3 className="block-title">Tags</h3>
          <div>
            {resolvedOperation.tags.map(tag => (
              <span key={tag} className="tag-item">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Parameters */}
      {resolvedOperation.parameters && resolvedOperation.parameters.length > 0 && (
        <div className="content-block">
          <h3 className="block-title">Parameters</h3>
          <div className="space-y-4">
            {resolvedOperation.parameters.map((param: any, index: number) => (
              <div key={index}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="param-name">{param.name}</span>
                  {param.required && <span className="param-required ">*</span>}
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-sm gap-3">{param.in}</span>
                  {param.schema?.type && (
                    <span className="param-type gap-3">type: {param.schema.type}</span>
                  )}
                </div>
                {param.description && (
                  <div className="text-gray-600 mt-1 ml-1">{param.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {resolvedOperation.requestBody && (
        <div className="content-block">
          <h3 className="block-title">Request Body</h3>
          {Object.entries(resolvedOperation.requestBody.content).map(([contentType, mediaType]) => (
            <div key={contentType}>
              <div className="code-header">{contentType}</div>
              {(mediaType as MediaTypeObject).schema && (
                <pre className="code-block">
                  <code>{JSON.stringify((mediaType as MediaTypeObject).schema, null, 2)}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Responses */}
      {resolvedOperation.responses && (
        <div className="content-block">
          <h3 className="block-title">Responses</h3>
          {Object.entries(resolvedOperation.responses).map(([code, response]) => (
            <div key={code} className="mb-6 last:mb-0">
              <div className="flex items-center mb-3">
                <span className={`response-code ${getResponseCodeClass(code)}`}>
                  {code}
                </span>
                <span className="text-gray-600">{response.description}</span>
              </div>
              {response.content && (
                <div>
                  {Object.entries(response.content).map(([contentType, mediaType]) => (
                    <div key={contentType}>
                      <div className="code-header">{contentType}</div>
                      {(mediaType as MediaTypeObject).schema && (
                        <pre className="code-block">
                          <code>{JSON.stringify((mediaType as MediaTypeObject).schema, null, 2)}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Path;