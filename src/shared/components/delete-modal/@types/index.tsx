export interface DeleteModalProps {
  onConfirm: () => void;
  title: string;
  description: string;
  actionText: string;
  triggerLabel?: string;
}
