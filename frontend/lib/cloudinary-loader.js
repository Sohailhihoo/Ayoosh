/**
 * Custom Next.js Image loader for Cloudinary URLs.
 *
 * Strips any existing transform segment (e.g. f_auto,q_auto,w_1280)
 * and re-inserts width/quality/format transforms requested by the
 * Next.js <Image> component.
 */
export default function cloudinaryLoader({ src, width, quality }) {
  const q = quality || 'auto';
  const transforms = `f_auto,q_auto:${q},w_${width}`;

  // If the URL already contains /upload/<transforms>/, replace the transform segment
  const withTransforms = src.replace(
    /\/upload\/[^/]+\//,
    `/upload/${transforms}/`
  );

  // If no transform was replaced (URL didn't match pattern), insert after /upload/
  if (withTransforms === src) {
    return src.replace('/upload/', `/upload/${transforms}/`);
  }

  return withTransforms;
}
