import type { ReactNode, SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function createIcon(path: ReactNode) {
  return ({ size = 18, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {path}
    </svg>
  );
}

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />);

export const TrashIcon = createIcon(
  <>
    <path d="M5 7h14" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </>,
);

export const PencilIcon = createIcon(
  <>
    <path d="m4 20 4-1 9-9-3-3-9 9-1 4z" />
    <path d="m14 5 3 3" />
  </>,
);

export const CheckIcon = createIcon(<path d="m5 13 4 4L19 7" />);

export const CircleIcon = createIcon(<circle cx={12} cy={12} r={8} />);

export const GripIcon = createIcon(
  <>
    <circle cx={9} cy={9} r={1} fill="currentColor" stroke="none" />
    <circle cx={15} cy={9} r={1} fill="currentColor" stroke="none" />
    <circle cx={9} cy={15} r={1} fill="currentColor" stroke="none" />
    <circle cx={15} cy={15} r={1} fill="currentColor" stroke="none" />
  </>,
);

export const CloseIcon = createIcon(
  <>
    <path d="M6 6l12 12M18 6l-12 12" />
  </>,
);
