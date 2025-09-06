export interface UpdateModalProps {
  onConfirm: () => void;
  title: string;
  description: string;
  actionText: string;
  triggerLabel?: string;
}
