import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ZodSchema, ZodError, z } from 'zod';

// Store schemas by DTO class name
const schemaRegistry = new Map<string, ZodSchema>();

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // If a schema was provided via constructor, use it
    if (this.schema) {
      return this.validate(value, this.schema);
    }

    // Try to get schema from metatype
    const schema = this.getSchemaFromMetatype(metadata.metatype);
    if (schema) {
      return this.validate(value, schema);
    }

    // No schema found, return value as-is
    return value;
  }

  private validate(value: unknown, schema: ZodSchema): unknown {
    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => {
          const path = err.path.join('.');
          return path ? `${path}: ${err.message}` : err.message;
        });

        throw new BadRequestException({
          statusCode: 400,
          message: messages,
          error: 'Validation Error',
        });
      }
      throw error;
    }
  }

  private getSchemaFromMetatype(
    metatype: ArgumentMetadata['metatype'],
  ): ZodSchema | undefined {
    if (!metatype) return undefined;

    // Check registry first
    const registered = schemaRegistry.get(metatype.name);
    if (registered) return registered;

    // Check if the class has a static schema property
    const classWithSchema = metatype as unknown as { schema?: ZodSchema };
    if (classWithSchema.schema) {
      return classWithSchema.schema;
    }

    return undefined;
  }
}

/**
 * Register a Zod schema for a DTO class
 */
export function registerSchema(dtoClass: new (...args: unknown[]) => unknown, schema: ZodSchema): void {
  schemaRegistry.set(dtoClass.name, schema);
}

/**
 * Create a DTO class with an attached Zod schema
 * Use this to create DTOs that work with ZodValidationPipe
 */
export function createZodDto<T extends ZodSchema>(schema: T) {
  abstract class ZodDtoClass {
    static schema = schema;
  }

  // Register the schema
  schemaRegistry.set(ZodDtoClass.name, schema);

  return ZodDtoClass as unknown as new () => z.infer<T>;
}

/**
 * Type helper to infer the type from a Zod schema
 */
export type InferZodDto<T extends ZodSchema> = z.infer<T>;
