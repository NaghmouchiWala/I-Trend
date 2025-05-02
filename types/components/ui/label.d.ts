export interface LabelProps {
    text: string;
    htmlFor?: string;
}

declare module '@/components/ui/label' {
    export function Label(props: LabelProps): JSX.Element;
}