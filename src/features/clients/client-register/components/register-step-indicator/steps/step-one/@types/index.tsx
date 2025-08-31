import type { StepOneData } from '../../../@types';

export interface StepOneProps {
  data: StepOneData;
  setData: React.Dispatch<React.SetStateAction<StepOneData>>;
}
