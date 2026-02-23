import { useEffect, useState } from 'react';
import { isVaultRef, resolveAssetToUrl } from '../lib/assetVault';

interface UseAssetUrlResult {
  url: string | undefined;
  isResolving: boolean;
  error: string | null;
}

export function useAssetUrl(source: string | undefined): UseAssetUrlResult {
  const [url, setUrl] = useState<string | undefined>(() =>
    source && !isVaultRef(source) ? source : undefined
  );
  const [isResolving, setIsResolving] = useState<boolean>(() => Boolean(source && isVaultRef(source)));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;

    const cleanupObjectUrl = () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
      objectUrl = undefined;
    };

    setError(null);

    if (!source) {
      setUrl(undefined);
      setIsResolving(false);
      return () => {
        cleanupObjectUrl();
      };
    }

    if (!isVaultRef(source)) {
      setUrl(source);
      setIsResolving(false);
      return () => {
        cleanupObjectUrl();
      };
    }

    setUrl(undefined);
    setIsResolving(true);

    resolveAssetToUrl(source)
      .then((resolvedUrl) => {
        if (disposed) {
          if (resolvedUrl && resolvedUrl.startsWith('blob:')) {
            URL.revokeObjectURL(resolvedUrl);
          }
          return;
        }

        objectUrl = resolvedUrl;
        setUrl(resolvedUrl);
      })
      .catch((caughtError) => {
        if (disposed) return;
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to resolve asset.');
      })
      .finally(() => {
        if (!disposed) {
          setIsResolving(false);
        }
      });

    return () => {
      disposed = true;
      cleanupObjectUrl();
    };
  }, [source]);

  return { url, isResolving, error };
}
