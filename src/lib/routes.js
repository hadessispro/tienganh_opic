import { dynamicRouteMatchers, pageDefinitions } from "../config/pageDefinitions";

const aliasToDefinition = new Map();

for (const definition of pageDefinitions) {
  aliasToDefinition.set(definition.path, definition);
  for (const alias of definition.aliases || []) {
    aliasToDefinition.set(alias, definition);
  }
}

export function normalizePath(pathname) {
  if (!pathname) return "/";

  let path = pathname;
  try {
    path = decodeURI(path);
  } catch {
    path = pathname;
  }

  path = path.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");

  return path || "/";
}

export function getRouteDefinition(pathname) {
  const path = normalizePath(pathname);
  const exact = aliasToDefinition.get(path);
  if (exact) return { definition: exact, normalizedPath: path, isAlias: path !== exact.path };

  const dynamic = dynamicRouteMatchers.find((matcher) => path.startsWith(matcher.prefix));
  if (dynamic) {
    const definition = pageDefinitions.find((item) => item.id === dynamic.pageId);
    if (definition) {
      return { definition, normalizedPath: path, isAlias: true };
    }
  }

  const fallback = pageDefinitions[0];
  return { definition: fallback, normalizedPath: "/", isAlias: true };
}

export function getCanonicalPath(pathname) {
  return getRouteDefinition(pathname).definition.path;
}

export function getAllPublicPaths() {
  return pageDefinitions.map((definition) => definition.path);
}
