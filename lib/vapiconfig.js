import Vapi from "@vapi-ai/web";

let vapiInstance = null;

export const getVapiClient = () => {
  if (typeof window === "undefined") return null;

  if (!vapiInstance) {
    vapiInstance = new Vapi(
      process.env.NEXT_PUBLIC_VAPI_API_KEY
    );
  }

  return vapiInstance;
};
