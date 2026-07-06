import z from 'zod';

export function validateEmail(email: string) {
  return z.email().safeParse(email);
}

/**
 * Validates an object against a defined Zod schema.
 * @param {unknown} data - The data to be validated (must be a zod object). 
 * @param {z.ZodObject<Shape>} schema - The zod schema to be validated against.
 * @returns {{ success: boolean, data?: unknown, errors?: Record<string, string> }}
 */

export function validateObjectWithZod<Shape extends z.ZodRawShape>(
    data: unknown,
    schema: z.ZodObject<Shape>
  ) {
    const result = schema.safeParse(data);
  
    if (!result.success) {
      const tree = z.treeifyError(result.error);

      if (!('properties' in tree) || !tree.properties) 
        return { success: false, error: { message: 'failed to validate schema. (must be an object)' } };
  
      return {
        success: false,
        error: Object.fromEntries(
          Object.entries(tree.properties).map(([key, value]) => [
          key,
          value?.errors?.join(', '),
          ])
        ),
      };
    }
  
    return { success: true, data: result.data };
}