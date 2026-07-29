/**
 * Manifiesto de assets. Todos los archivos viven en public/media y se sirven
 * desde el propio dominio: la web no depende de ningun CDN externo.
 *
 * Las imagenes son WebP. Los originales PNG sumaban 43 MB; en WebP al 80% son
 * 1,5 MB sin diferencia visible a tamaño de pantalla.
 *
 * Para sustituir una: deja el archivo en public/media con el mismo nombre y
 * ajusta `w`/`h` si cambian las dimensiones. Ningun componente referencia una
 * ruta directamente.
 */
export interface ImageAsset { id: string; src: string; w: number; h: number; alt: string }

export const images: Record<string, ImageAsset> = {
  master: { id: "master", src: "/media/master.webp", w: 2752, h: 1536, alt: "Porsche 911 GT3 RS en tres cuartos delantero sobre asfalto húmedo de una carretera costera, con el mar al fondo en hora dorada." },
  rearThreeQuarter: { id: "rearThreeQuarter", src: "/media/rearThreeQuarter.webp", w: 2048, h: 1152, alt: "Tres cuartos trasero del gran turismo, zaga ancha y piloto corrido, luz baja de hora dorada." },
  cabin: { id: "cabin", src: "/media/cabin.webp", w: 2048, h: 1152, alt: "Habitáculo visto desde el asiento del conductor, cuero negro y aluminio cepillado con luz lateral dura." },
  wheelDash: { id: "wheelDash", src: "/media/wheelDash.webp", w: 2048, h: 1152, alt: "Volante y salpicadero, cuero con costura y radios de aluminio, centro del volante liso y sin emblema." },
  seat: { id: "seat", src: "/media/seat.webp", w: 2048, h: 1152, alt: "Butaca de cuero negro con costura de contraste y raíl de aluminio, luz rasante." },
  wheelArch: { id: "wheelArch", src: "/media/wheelArch.webp", w: 2048, h: 1152, alt: "Paso de rueda y llanta de aleación oscura sobre asfalto húmedo, flanco gris grafito mate." },
};

export const details: Record<string, ImageAsset> = {
  carbon: { id: "carbon", src: "/media/carbon.webp", w: 2048, h: 2048, alt: "Trama de fibra de carbono en macro, acabado mate y luz rasante." },
  brake: { id: "brake", src: "/media/brake.webp", w: 2048, h: 2048, alt: "Pinza de freno y disco perforado en macro, metal mecanizado y sombra dura." },
  lacquer: { id: "lacquer", src: "/media/lacquer.webp", w: 2048, h: 2048, alt: "Gotas de agua sobre laca gris grafito en macro, cada gota con su reflejo especular." },
};

export const cutouts: Record<string, ImageAsset> = {
  car: { id: "car", src: "/media/car.webp", w: 2048, h: 1152, alt: "Gran turismo gris grafito mate recortado en tres cuartos, sin fondo." },
};

/**
 * Clip de la vitrina. Se reproduce en bucle, silenciado, como fondo de la
 * seccion. No se sincroniza con nada, asi que no necesita timestamps.
 */
export const film = {
  id: "film",
  src: "/media/film.mp4",
  w: 1344,
  h: 768,
  duration: 4,
  poster: images.master.src,
};
