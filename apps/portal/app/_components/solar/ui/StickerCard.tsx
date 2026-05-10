import { cx } from "../../../_lib/utils"

export const StickerCard = ({
  title,
  description,
  Icon,
}: {
  title: string
  description: string
  Icon: React.ElementType
}) => (
  <div className="relative">
    <a
      className={cx(
        "relative z-10 mt-0 block h-full w-full overflow-hidden hover:cursor-pointer",
        "transition-all duration-180 ease-in-out",
        "rounded-lg rounded-tr-[26px] border border-border bg-card/30 px-4 pt-5 pb-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] before:absolute before:top-0 before:right-0 before:z-3 before:h-[30px] before:w-[30px] before:-translate-y-1/2 before:translate-x-1/2 before:rotate-45 before:bg-background before:shadow-[0_1px_0_0_rgba(255,255,255,0.08)] before:transition-all before:duration-180 before:ease-in-out before:content-[''] after:absolute after:top-0 after:right-0 after:z-2 after:size-7 after:-translate-y-2 after:translate-x-2 after:rounded-bl-lg after:border after:border-border after:bg-card after:shadow-xs after:transition-all after:duration-180 after:ease-in-out after:content-[''] hover:rounded-tr-[45px] hover:border-border-light hover:bg-card/50 hover:before:h-[50px] hover:before:w-[50px] hover:after:h-[42px] hover:after:w-[42px] hover:after:shadow-lg hover:after:shadow-black/30",
      )}
    >
      <div>
        <div className="relative flex items-center gap-2">
          <div className="absolute -left-4 h-5 w-[3px] rounded-r-sm bg-orange-500" />
          <Icon className="size-5 shrink-0 text-orange-500" />
          <h3 className="font-medium text-foreground">{title}</h3>
        </div>
        <p className="mt-2 text-muted sm:text-sm">{description}</p>
      </div>
    </a>
  </div>
)
