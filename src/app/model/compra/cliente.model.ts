import { Dados, DadosEmpresa, ReferenciaPessoal } from '.';

export class Cliente {
    dados: Dados;
    dadosEmpresa: DadosEmpresa;
    referenciaPessoal: ReferenciaPessoal[];

    constructor() {
        this.dados = new Dados();
        this.dadosEmpresa = new DadosEmpresa();

        this.referenciaPessoal = new Array();
        this.referenciaPessoal.push(new ReferenciaPessoal());
        this.referenciaPessoal.push(new ReferenciaPessoal());
    }
}
