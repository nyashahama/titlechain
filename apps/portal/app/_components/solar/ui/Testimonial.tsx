import { TitlechainMark } from "../TitlechainMark"

export default function Testimonial() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl shadow-orange-900/20">
      <div className="absolute top-76 -right-14 w-76 sm:top-48 sm:right-3 sm:w-92 md:top-48 md:right-0 md:w-100 lg:top-64 lg:right-12 lg:w-136">
        <TitlechainMark className="animate-hover size-32 text-orange-500/20" />
      </div>
      <div className="relative z-20 mb-20 p-8 sm:p-14 lg:p-24">
        <div className="">
          <blockquote className="relative max-w-2xl text-xl leading-relaxed tracking-tight text-gray-900 md:text-2xl lg:text-3xl">
            <p className="before:absolute before:top-0 before:right-full before:content-['\201C'] after:text-gray-900/70 after:content-['\201D']">
              <strong className="font-semibold">
                TitleChain has transformed our conveyancing practice.
              </strong>{" "}
              <span className="text-gray-900/70">
                What used to take days of manual checks across multiple systems
                now happens in seconds. The Clear-to-Lodge report gives us and
                our clients complete confidence before lodgement.
              </span>
            </p>
          </blockquote>
        </div>
        <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-base font-medium text-gray-900">
              Sarah van der Merwe
            </div>
            <div className="text-sm text-gray-500">
              Senior Conveyancer, VDM Attorneys
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
