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
    planted: "1,330",
    water: "97.9%",
    yield: "+7.4%",
    efficiency: "+2.1%",
    nutrients: "+5.3%",
    bgColor: "bg-emerald-500",
    changeType: "positive",
  },
  {
    name: "Review Required",
    value: "346",
    planted: "380",
    water: "91.1%",
    yield: "-8.9%",
    efficiency: "-4.5%",
    nutrients: "-3.2%",
    bgColor: "bg-amber-500",
    changeType: "negative",
  },
  {
    name: "Stop / Blocked",
    value: "89",
    planted: "102",
    water: "87.3%",
    yield: "-12.7%",
    efficiency: "-11.1%",
    nutrients: "-8.9%",
    bgColor: "bg-red-500",
    changeType: "negative",
  },
]

export default function FieldPerformance() {
  return (
    <div className="h-150 shrink-0 overflow-hidden mask-[radial-gradient(white_30%,transparent_90%)] perspective-[4000px] perspective-origin-center">
      <div className="-translate-y-10 -translate-z-10 rotate-x-10 rotate-y-20 -rotate-z-10 transform-3d">
        <h3 className="text-sm text-gray-500">Decision Outcomes</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">
          1,863 checks
        </p>
        <p className="mt-1 text-sm font-medium">
          <span className="text-emerald-700">+98 checks (5.6%)</span>{" "}
          <span className="font-normal text-gray-500">Past 30 days</span>
        </p>
        <LineChartIllustration className="mt-8 w-full min-w-200 shrink-0" />

        <TableRoot className="mt-6 min-w-200">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Outcome</TableHeaderCell>
                <TableHeaderCell className="text-right">Count</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Expected
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Accuracy
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Volume Δ
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Speed
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Confidence
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex space-x-3">
                      <span
                        className={item.bgColor + " w-1 shrink-0 rounded"}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.value}</TableCell>
                  <TableCell className="text-right">{item.planted}</TableCell>
                  <TableCell className="text-right">{item.water}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.changeType === "positive"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    >
                      {item.yield}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.changeType === "positive"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    >
                      {item.efficiency}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.changeType === "positive"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    >
                      {item.nutrients}
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
