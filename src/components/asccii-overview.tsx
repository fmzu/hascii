type Props = {
  grid: (string | null)[][]
}

export const AsciiOverview = (props: Props) => {
  const { grid } = props

  return (
    <div className="ascii-overview">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="ascii-overview-row">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className="ascii-overview-cell"
              style={{ backgroundColor: cell ? "black" : "white" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
