export interface MenuItem {
    label: string;
    icon: string;
    action: (...args:any) => void;

}