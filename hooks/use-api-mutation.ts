import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import { useState } from "react";

const useConvexMutation = <
  Mutation extends FunctionReference<"mutation", "public">,
>(
  fn: Mutation
) => {
  const [pending, setPending] = useState(false);
  const mutateFn = useMutation(fn);

  const mutate = async (payload: Mutation["_args"]) => {
    setPending(true);
    try {
      const data = await mutateFn(payload);
      return data;
    } catch (err) {
      const error = err as Error;
      throw new Error(error.message);
    } finally {
      setPending(false);
    }
  };

  return { mutate, pending };
};

export default useConvexMutation;