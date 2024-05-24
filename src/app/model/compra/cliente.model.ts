import { Dados, DadosEmpresa, ReferenciaPessoal } from '.';
import { v4 as uuidv4 } from 'uuid';

export class Cliente {
    id: string;
    idRelacao: string;
    visivel: boolean;
    clientePrincipal: boolean;
    conjuge: boolean;
    dados: Dados;
    dadosEmpresa: DadosEmpresa;
    referenciaPessoal: ReferenciaPessoal[];

    constructor(opcao?: {clientePrincipal?: boolean, idRelacao?: string, conjuge?: boolean, visivel?: boolean}) {
        this.id = uuidv4();
        this.idRelacao = opcao?.idRelacao ? opcao.idRelacao : undefined;
        this.clientePrincipal = opcao?.clientePrincipal ? opcao.clientePrincipal : false;
        this.visivel = opcao?.visivel ? opcao.visivel : true;
        this.conjuge = opcao?.conjuge ? opcao.conjuge : false;
        this.dados = new Dados();
        this.dadosEmpresa = new DadosEmpresa();

        this.referenciaPessoal = new Array();
        this.referenciaPessoal.push(new ReferenciaPessoal());
        this.referenciaPessoal.push(new ReferenciaPessoal());
    }
}
