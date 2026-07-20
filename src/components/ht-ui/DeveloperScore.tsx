import { RatingCard, type RatingAxis } from './RatingCard';

export type DeveloperScoreProps = {
  title?: string;
  overall: number;
  max?: number;
  axes: RatingAxis[];
  className?: string;
};

export function DeveloperScore({
  title = 'Developer Score',
  overall,
  max = 10,
  axes,
  className = '',
}: DeveloperScoreProps) {
  return <RatingCard title={title} score={overall} max={max} axes={axes} className={className} />;
}
