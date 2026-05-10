import { LineChartIllustration } from "../LineChartIllustration"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "../Table"

const summary = [
  {
    name: "Clear-to-Lodge",
    value: "1,428",
    processed: "1,330",
    accuracy: "97.9%",
    volume_change: "+7.4%",
    avg_response_ms: "210ms",
    confidence: "94%",
    bgColor: "bg-emerald-500",
    changeType: "positive",
  },
  {
    name: "Review Required",
    value: "346",
    processed: "380",
    accuracy: "91.1%",
    volume_change: "-8.9%",
    avg_response_ms: "890ms",
    confidence: "82%",
    bgColor: "bg-amber-500",
    changeType: "negative",
  },
  {
    name: "Stop / Blocked",
    value: "89",
    processed: "102",
    accuracy: "87.3%",
    volume_change: "-12.7%",
    avg_response_ms: "1.2s",
    confidence: "97%",
    bgColor: "bg-red-500",
    changeType: "negative",
  },
]

export default function DecisionOutcomes() {
  return (
    <div className="h-150 shrink-0 overflow-hidden mask-[radial-gradient(white_30%,transparent_90%)] perspective-[4000px] perspective-origin-center">
      <div className="-translate-y-10 -translate-z-10 rotate-x-10 rotate-y-20 -rotate-z-10 transform-3d">
        <h3 className="text-sm text-muted">Decision Outcomes</h3>
        <p className="mt-1 text-3xl font-semibold text-foreground">
          1,863 checks
        </p>
        <p className="mt-1 text-sm font-medium">
          <span className="text-emerald-400">+98 checks (5.6%)</span>{" "}
          <span className="font-normal text-muted">Past 30 days</span>
        </p>
        <LineChartIllustration className="mt-8 w-full min-w-200 shrink-0" />

        <TableRoot className="mt-6 min-w-200">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Outcome</TableHeaderCell>
                <TableHeaderCell className="text-right">Checks</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Processed
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Accuracy
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Volume Δ
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Response Time
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Confidence
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex space-x-3">
                      <span
                        className={item.bgColor + " w-1 shrink-0 rounded"}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.value}</TableCell>
                  <TableCell className="text-right">{item.processed}</TableCell>
                  <TableCell className="text-right">{item.accuracy}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.changeType === "positive"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {item.volume_change}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.changeType === "positive"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {item.avg_response_ms}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.changeType === "positive"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {item.confidence}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </div>
    </div>
  )
}
