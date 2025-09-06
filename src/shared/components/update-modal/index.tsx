import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { UpdateModalProps } from './@types';

export const UpdateModal = ({
  onConfirm,
  title,
  description,
  actionText,
  triggerLabel,
}: UpdateModalProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          {triggerLabel ?? <RefreshCw className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-blue-600 border-blue-600 hover:text-blue-700">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
