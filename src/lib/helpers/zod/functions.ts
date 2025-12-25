import z from 'zod';

/**
 * Validates a Zod object and returns the outcome.
 * @param {unknown} data - The data to be validated (must be a zod object). 
 * @param {z.ZodObject<Shape>} schema - The zod schema to be validated against.
 * @returns {{ success: boolean, data?: unknown, errors?: Record<string, string> }}
 */

export function validateWithZod<Shape extends z.ZodRawShape>(
    data: unknown,
    schema: z.ZodObject<Shape>
  ) {
    const result = schema.safeParse(data);
  
    if (!result.success) {
      const tree = z.treeifyError(result.error);

      if (!('properties' in tree) || !tree.properties) 
        return { success: false, errors: { message: 'failed to validate schema. (zod objects only)' } };
  
      return {
        success: false,
        errors: Object.fromEntries(
          Object.entries(tree.properties).map(([key, value]) => [
          key,
          value?.errors?.join(', '),
          ])
        ),
      };
    }
  
    return { success: true, data: result.data };
}