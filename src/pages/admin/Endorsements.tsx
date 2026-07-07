import { Plus } from "lucide-react";
import { Btn } from "../../components/shared/Btn";
import { Avatar } from "../../components/shared/Avatar";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import { kanbanColumns, kanbanCards } from "../../data/chartData";
import { candidates } from "../../data/candidates";

export function EndorsementKanban() {
  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Endorsement Pipeline
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track candidates through every stage of placement
          </p>
        </div>
        <Btn>
          <Plus size={13} />
          New Endorsement
        </Btn>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {kanbanColumns.map((col) => {
          const cards = kanbanCards.filter((card) => card.stage === col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-52">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-xs font-semibold text-gray-600">
                    {col.label}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md tabular-nums">
                  {cards.length}
                </span>
              </div>

              <div className="space-y-2">
                {cards.map((card) => {
                  const candidate = candidates.find(
                    (c) => c.id === card.candidateId,
                  );
                  if (!candidate) return null;
                  return (
                    <div
                      key={`${card.candidateId}-${col.id}`}
                      className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar
                          name={candidate.name}
                          photo={candidate.photo}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#222222] truncate">
                            {candidate.name}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {candidate.title}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mb-2 truncate">
                        {card.agency}
                      </div>
                      <ReadinessBar score={candidate.readinessScore} />
                      <div className="text-[10px] text-gray-400 mt-2">
                        {card.date}
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl h-16 flex items-center justify-center">
                    <span className="text-[10px] text-gray-300">
                      No candidates
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
