import React, { useState, ChangeEvent } from 'react';
import * as openApiParser from '../services/JsonDefParser';
import { OpenAPIDocument, PathItem, Operation } from '../types/types';
import Renderer from '../services/Renderer';

const APIDefinitionRenderer: React.FC = () => {
  const [apiSpec, setApiSpec] = useState<OpenAPIDocument | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      let parsedContent: OpenAPIDocument;
      try {
        parsedContent = openApiParser.parse(content, fileExtension);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Parsing error: ${errorMessage}`);
        return;
      }

      setApiSpec(parsedContent);
      console.log(parsedContent)
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to parse file: ${errorMessage}`);
    }
  };

  return (
    <div>
      <div>
      {!apiSpec && (
        <div>
          <div>API Definition Renderer</div>
          <div>
            <input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={ handleFileUpload }
            />
            {error && (
              <div>
                <p>Oops... Error</p>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

        {apiSpec && (
          <div>
            <h2>
              {apiSpec.info?.title || 'API Specification'}
            </h2>
            {apiSpec.paths && Object.entries(apiSpec.paths).map(([path, methods]) => 
              <Renderer spec={apiSpec}/>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default APIDefinitionRenderer;