import { getImageProps } from "next/image";

export function Icone({
  name: nome,
  size: tamanho = 22,
}: {
  name:
    | "heart"
    | "grid"
    | "people"
    | "arrow"
    | "shield"
    | "phone"
    | "book"
    | "lock"
    | "logout"
    | "search"
    | "check";
  size?: number;
}) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    heart: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        <path d="M3 12h4l2-4 4 8 2-4h6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 10-8 10S4 17 4 12V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M10 18h4" />
      </>
    ),
    book: (
      <>
        <path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5m5-12 4 4-4 4m-6-4h12" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[nome]}
    </svg>
  );
}

export function MarcaViva({
  inverse = false,
  grande = false,
}: {
  inverse?: boolean;
  grande?: boolean;
}) {
  const { props: propriedadesImagem } = getImageProps({
    src: "/images/individuais/01_logos/logo_viva_mais_sem_slogan.png",
    alt: "Viva+",
    width: 1278,
    height: 1230,
    sizes: grande ? "164px" : "128px",
    loading: "eager",
  });
  // Next prepara srcset/sizes; a aparência fica em CSS para respeitar a CSP.
  return (
    <span
      className={`brand ${inverse ? "brand-inverse" : ""} ${grande ? "brand-grande" : ""}`}
    >
      <img {...propriedadesImagem} style={undefined} />
    </span>
  );
}
