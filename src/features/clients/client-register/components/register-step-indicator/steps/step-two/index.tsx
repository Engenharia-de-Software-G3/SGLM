import { Input } from '@/components/ui/input';
import type { StepTwoProps } from './@types';

export const StepTwo = ({ data, setData }: StepTwoProps) => (
  <div className="space-y-6">
    <div>
      <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-2">
        Banco
      </label>
      <Input
        id="banco"
        placeholder="Insira o nome do banco"
        value={data.banco || ''}
        onChange={(e) => setData((old) => ({ ...old, banco: e.target.value }))}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="agencia" className="block text-sm font-medium text-gray-700 mb-2">
          Agência
        </label>
        <Input
          id="agencia"
          type="number"
          placeholder="Insira o número de sua agência"
          value={data.agencia || ''}
          onChange={(e) => setData((old) => ({ ...old, agencia: e.target.value }))}
        />
      </div>
      <div>
        <label htmlFor="digitoAgencia" className="block text-sm font-medium text-gray-700 mb-2">
          Dígito
        </label>
        <Input
          id="digitoAgencia"
          type="number"
          value={data.digitoAgencia || ''}
          onChange={(e) => setData((old) => ({ ...old, digitoAgencia: e.target.value }))}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="conta" className="block text-sm font-medium text-gray-700 mb-2">
          Conta
        </label>
        <Input
          id="conta"
          type="number"
          placeholder="Insira o número da conta"
          value={data.conta || ''}
          onChange={(e) => setData((old) => ({ ...old, conta: e.target.value }))}
        />
      </div>
      <div>
        <label htmlFor="digitoConta" className="block text-sm font-medium text-gray-700 mb-2">
          Dígito
        </label>
        <Input
          id="digitoConta"
          type="number"
          value={data.digitoConta || ''}
          onChange={(e) => setData((old) => ({ ...old, digitoConta: e.target.value }))}
        />
      </div>
    </div>
  </div>
);
