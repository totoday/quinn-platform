export type QuinnMutationAccess =
  | 'read_only'
  | 'needs_confirmation'
  | 'full_access';

export class QuinnMutationAccessError extends Error {
  readonly access: QuinnMutationAccess;
  readonly operation: string;
  readonly code: 'MUTATION_BLOCKED' | 'MUTATION_CONFIRMATION_REQUIRED';

  constructor(input: {
    access: QuinnMutationAccess;
    operation: string;
    code: 'MUTATION_BLOCKED' | 'MUTATION_CONFIRMATION_REQUIRED';
    message: string;
  }) {
    super(input.message);
    this.name = 'QuinnMutationAccessError';
    this.access = input.access;
    this.operation = input.operation;
    this.code = input.code;
  }
}

export function assertMutationAllowed(
  access: QuinnMutationAccess,
  operation: string
): void {
  if (access === 'full_access') {
    return;
  }

  if (access === 'needs_confirmation') {
    throw new QuinnMutationAccessError({
      access,
      operation,
      code: 'MUTATION_CONFIRMATION_REQUIRED',
      message: `Quinn SDK mutation requires confirmation before executing "${operation}".`,
    });
  }

  throw new QuinnMutationAccessError({
    access,
    operation,
    code: 'MUTATION_BLOCKED',
    message: `Quinn SDK mutation blocked because mutationAccess is "${access}" for "${operation}".`,
  });
}

