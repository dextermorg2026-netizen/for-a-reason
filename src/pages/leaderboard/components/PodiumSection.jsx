import PodiumCard from "./PodiumCard";

const PodiumSection = ({ topThree, getInitials }) => {
  return (
    <div className="podium-wrapper">
      <div className="podium-glow" />

      <div className="podium-row">
        {topThree[1] && (
          <PodiumCard
            user={topThree[1]}
            rank={2}
            score={topThree[1].score}
            getInitials={getInitials}
          />
        )}

        {topThree[0] && (
          <PodiumCard
            user={topThree[0]}
            rank={1}
            score={topThree[0].score}
            getInitials={getInitials}
            large
          />
        )}

        {topThree[2] && (
          <PodiumCard
            user={topThree[2]}
            rank={3}
            score={topThree[2].score}
            getInitials={getInitials}
          />
        )}
      </div>
    </div>
  );
};

export default PodiumSection;