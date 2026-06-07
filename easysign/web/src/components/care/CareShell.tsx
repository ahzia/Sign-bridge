import { lazy, Suspense } from 'react';
import { usePathname } from '../../hooks/usePathname';

const CareVisit = lazy(() => import('./CareVisit'));
const CareStaffView = lazy(() => import('./CareStaffView'));
const CarePatientKiosk = lazy(() => import('./CarePatientKiosk'));

const CareShell = () => {
  const pathname = usePathname();

  const content =
    pathname === '/care/staff' ? (
      <CareStaffView />
    ) : pathname === '/care/patient' ? (
      <CarePatientKiosk />
    ) : (
      <CareVisit />
    );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 loading-spinner" />
        </div>
      }
    >
      {content}
    </Suspense>
  );
};

export default CareShell;
