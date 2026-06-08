import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

/**
 * App-wide toast surface. Mounted once near the root; fire toasts from anywhere
 * with `import { toast } from 'sonner'`.
 */
export function Toaster(props: ToasterProps) {
	return <SonnerToaster theme="dark" richColors closeButton position="top-center" {...props} />;
}
