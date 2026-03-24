export class QuinnMutationGuardError extends Error {
  readonly allowQuinnMutation: boolean;
  readonly operation: string;
  readonly code: 'MUTATION_BLOCKED';

  constructor(input: {
    allowQuinnMutation: boolean;
    operation: string;
    code: 'MUTATION_BLOCKED';
    message: string;
  }) {
    super(input.message);
    this.name = 'QuinnMutationGuardError';
    this.allowQuinnMutation = input.allowQuinnMutation;
    this.operation = input.operation;
    this.code = input.code;
  }
}

export function assertMutationAllowed(
  allowQuinnMutation: boolean,
  operation: string
): void {
  if (allowQuinnMutation) {
    return;
  }

  throw new QuinnMutationGuardError({
    allowQuinnMutation,
    operation,
    code: 'MUTATION_BLOCKED',
    message: `Quinn SDK mutation blocked because allowQuinnMutation is false for "${operation}".`,
  });
}
