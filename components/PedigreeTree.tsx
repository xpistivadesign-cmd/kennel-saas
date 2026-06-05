function isCriticalEdge(from: string, to: string) {
    return paths.some(
      (p) =>
        p.sirePath.includes(from) &&
        p.damPath.includes(to)
    );
  }

  function renderNode(node: PedigreeNode, x = 0, y = 0) {
    if (!node) return null;

    const color = getNodeColor(node.id);

    return (
      <g key={node.id} transform={`translate(${x}, ${y})`}>
        {/* NODE */}
        <rect
          x={-40}
          y={-20}
          width={80}
          height={40}
          rx={8}
          fill={color}
          stroke="#111"
          strokeWidth={1}
        />

        <text
          x={0}
          y={5}
          textAnchor="middle"
          fontSize={10}
          fill="#111"
        >
          {node.name || node.id}
        </text>

        {/* EDGES */}
        {node.sire && (
          <line
            x1={0}
            y1={0}
            x2={-120}
            y2={-80}
            stroke={
              isCriticalEdge(node.id, node.sire.id)
                ? "red"
                : "#999"
            }
            strokeWidth={
              isCriticalEdge(node.id, node.sire.id) ? 3 : 1
            }
          />
        )}

        {node.dam && (
          <line
            x1={0}
            y1={0}
            x2={120}
            y2={-80}
            stroke={
              isCriticalEdge(node.id, node.dam.id)
                ? "red"
                : "#999"
            }
            strokeWidth={
              isCriticalEdge(node.id, node.dam.id) ? 3 : 1
            }
          />
        )}

        {/* CHILDREN */}
        {node.sire && renderNode(node.sire, x - 120, y - 80)}
        {node.dam && renderNode(node.dam, x + 120, y - 80)}
      </g>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white">
      <svg width={1200} height={800}>
        {renderNode(root, 600, 700)}
      </svg>
    </div>
  );
}
