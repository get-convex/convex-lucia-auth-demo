import {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation, ReactMutation,
} from "convex/react";
import { FunctionReference } from "convex/server";
import { useCallback } from "react";
import { useSessionId } from "./SessionProvider";

export function useQuery<
  Args extends { sessionId: string | null },
  Query extends FunctionReference<"query", "public", Args>
>(
  query: Query,
  args: Omit<Query["_args"], "sessionId">
): Query["_returnType"] | undefined {
  const sessionId = useSessionId();
  return useConvexQuery(query, { ...args, sessionId } as any);
}

export function useMutation<
  Args extends { sessionId: string | null },
  Mutation extends FunctionReference<"mutation", "public", Args>
>(
  mutation: Mutation
): ReactMutation<
  FunctionReference<"mutation", "public", Omit<Mutation["_args"], "sessionId">>
> {
  const doMutation = useConvexMutation(mutation);
  const sessionId = useSessionId();
  return useCallback(
    (args: Omit<Mutation["_args"], "sessionId">) => {
      return doMutation({ ...args, sessionId } as any);
    },
    [doMutation, sessionId]
  ) as any; // We don't support optimistic updates
}
