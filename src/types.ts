/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolId = 
  | 'home'
  | 'json' 
  | 'jsonschema'
  | 'jsonpath'
  | 'openapi'
  | 'webhook'
  | 'mockapi'
  | 'api' 
  | 'graphql'
  | 'docker'
  | 'k8s'
  | 'nginx'
  | 'xml' 
  | 'base64' 
  | 'url' 
  | 'html'
  | 'jwt' 
  | 'sql' 
  | 'timestamp' 
  | 'text'
  | 'yaml'
  | 'hash'
  | 'minify'
  | 'uuid'
  | 'qrcode'
  | 'markdown'
  | 'csv'
  | 'color'
  | 'base'
  | 'cron'
  | 'regex'
  | 'diff'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'ads_txt'
  | 'robots_txt'
  | 'sitemap_xml'
  | 'indexnow'
  | 'indexnow_key';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  category: 'formatter' | 'network' | 'encoder' | 'utility' | 'devops';
  icon: string; // Name of Lucide icon
}

// API Tester Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  bodyType: 'none' | 'json' | 'text' | 'form-data';
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
  error?: string;
}

export interface SavedApiRequest {
  id: string;
  name: string;
  request: ApiRequest;
  timestamp: number;
}
