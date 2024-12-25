import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { Input } from "./ui/input";
import { IOrder } from "@/types/order";

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmOption: string;
  onSubmit: (orderId: string, cancellationReason: string) => void;
  order?: IOrder;
}

const FlagModal = ({
  isOpen,
  onClose,
  title,
  confirmOption,
  onSubmit,
  order,
}: FlagModalProps) => {
  const [cancellationReason, setCancellationReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="my-4">
          <label
            htmlFor="cancellation-reason"
            className="block text-sm font-medium text-gray-700"
          >
            Cancellation Reason
          </label>
          <Input
            id="cancellation-reason"
            type="text"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Enter cancellation reason"
            className="mt-2"
          />
        </div>

        <DialogFooter className="flex flex-col md:flex-row justify-end gap-2">
          <Button className="order-2" variant="destructive" onClick={onClose}>
            No
          </Button>

          <Button
            className="order-1"
            variant="default"
            onClick={async () => {
              if (!cancellationReason.trim()) return;
              onSubmit(order?._id!, cancellationReason);
              setCancellationReason("");
              onClose();
            }}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            {confirmOption}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagModal;
