import { CreateUrlModal } from './Modals/CreateUrlModal';
import { DeleteConfirmModal } from './Modals/DeleteConfirmModal';
import { EditUrlModal } from './Modals/EditUrlModal';
import { QRCodeModal } from './Modals/QRCodeModal';
import { ProfileModal } from './Modals/ProfileModal';
import { BulkImportModal } from './Modals/BulkImportModal';

export const ModalContainer: React.FC = () => {
  return (
    <>
      <CreateUrlModal />
      <DeleteConfirmModal />
      <EditUrlModal />
      <QRCodeModal />
      <ProfileModal />
      <BulkImportModal />
    </>
  );
};
