const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function toAppPath(pathname: string): string {
  if (basePath && pathname === basePath) {
    return '/';
  }

  if (basePath && pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || '/';
  }

  return pathname || '/';
}

export function toBrowserPath(appPath: string): string {
  const normalizedPath = appPath.startsWith('/') ? appPath : `/${appPath}`;
  return `${basePath}${normalizedPath}` || '/';
}

export function assetPath(path: string): string {
  if (!path || /^(https?:|data:|mailto:|tel:|#)/.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}

