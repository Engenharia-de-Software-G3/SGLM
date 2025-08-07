import { CardLogin } from '../card-login';

export const LoginContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ffffff] to-[#d5dae6] flex items-center justify-center">
      <div className="flex w-full max-w-6xl">
        <div className="flex-1 flex mt-28 ml-16">
          <h1 className="text-[7rem] font-bold text-black font-russo">SGLM</h1>
        </div>

        <CardLogin />
      </div>
    </div>
  );
};
