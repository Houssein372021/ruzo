import { motion } from "framer-motion";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
};

export function SectionHeading({ eyebrow, title, copy }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-display text-[#8b725f]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-4xl text-[#111111] sm:text-5xl">{title}</h2>
      {copy ? <p className="mt-4 text-sm leading-7 text-[#6d6258] sm:text-base">{copy}</p> : null}
    </motion.div>
  );
}
