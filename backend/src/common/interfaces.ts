/**
 * Base Service Interface
 * Toutes les features doivent implémenter cette interface
 */
export interface IFeatureService {
  /**
   * Nom unique de la feature
   */
  getName(): string;

  /**
   * Version de la feature
   */
  getVersion(): string;

  /**
   * Initialisation de la feature
   */
  initialize?(): Promise<void>;

  /**
   * Nettoyage des ressources
   */
  cleanup?(): Promise<void>;

  /**
   * Health check
   */
  healthCheck?(): Promise<boolean>;

  /**
   * Métadonnées de la feature
   */
  getMetadata?(): FeatureMetadata;
}

export interface FeatureMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  enabled: boolean;
  experimental?: boolean;
}

/**
 * Base Repository Interface
 * Pattern Repository pour abstraction de la couche data
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(filter?: any): Promise<number>;
}

/**
 * Base Controller Interface
 */
export interface IController {
  getRoutePrefix(): string;
  getRoutes(): RouteMetadata[];
}

export interface RouteMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: string;
  auth?: boolean;
  roles?: string[];
}

/**
 * Base Use Case Interface
 * Clean Architecture - Use Cases encapsulent la logique métier
 */
export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

/**
 * DTO Base Interface
 */
export interface IDto {
  validate?(): boolean | Promise<boolean>;
  toJSON?(): object;
}

/**
 * Query Handler Interface (CQRS pattern)
 */
export interface IQueryHandler<Query, Result> {
  handle(query: Query): Promise<Result>;
}

/**
 * Command Handler Interface (CQRS pattern)
 */
export interface ICommandHandler<Command, Result> {
  handle(command: Command): Promise<Result>;
}

/**
 * Event Handler Interface
 */
export interface IEventHandler<Event> {
  handle(event: Event): Promise<void>;
}

/**
 * Factory Interface
 */
export interface IFactory<T> {
  create(data: any): T;
}

/**
 * Strategy Interface (Strategy Pattern)
 */
export interface IStrategy<Input, Output> {
  execute(input: Input): Promise<Output>;
  canHandle(input: Input): boolean;
}

/**
 * Observer Interface (Observer Pattern)
 */
export interface IObserver<T> {
  update(data: T): void | Promise<void>;
}

/**
 * Cache Interface
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Logger Interface
 */
export interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}

/**
 * Validator Interface
 */
export interface IValidator<T> {
  validate(data: T): Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Mapper Interface (Entity <-> DTO)
 */
export interface IMapper<Entity, Dto> {
  toDto(entity: Entity): Dto;
  toEntity(dto: Dto): Entity;
  toDtoList(entities: Entity[]): Dto[];
  toEntityList(dtos: Dto[]): Entity[];
}
