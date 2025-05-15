TODO LIST
- criar um mapa mental para acompanhar melhor a navegação entre as telas e suas funções
- criar um menu de estabelecimentos após o Login do cliente, esse menu deve listar todos os estabelecimentos registrados no banco de dados
- após o cliente selecionar um estabelecimento, ele será direcionado ao cardápio do mesmo
- o cardápio do estabelecimento é gerido pelo proprietário do mesmo, todos os produtos informados pelo proprietário na sua dashboard de proprietário, devem aparecer listados no cardapio do cliente

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

COMO BAIXAR (CLONAR) SEU PROJETO EM OUTRA MÁQUINA:

1. Instale o Git na outra máquina (se ainda não tiver):
- https://git-scm.com/downloads
2. Abra o Visual Studio Code na nova máquina.
3. No VS Code, abra o terminal (atalho: Ctrl + `).
4. Vá até a pasta onde quer salvar o projeto:
- cd caminho/da/pasta/destino
- (ou ir até a pasta manualmente, pelo gerenciador de arquivos em "Open Folder" no canto superior esquerdo do seu VS Code)
5. No terminal, clone o repositório com o seguinte comando:
- git clone https://github.com/btpjamal/projetoFaculdade
6. Acesse a pasta clonada:
- cd projetoFaculdade
7. Instale as dependências do projeto:
- Se for um projeto com Node.js, React, React Native, etc., você provavelmente precisa instalar as dependências com:
- npm install
8. Após clonar o projeto, é importante que cada colaborador crie ou selecione a branch na qual deseja contribuir. Por exemplo, se for trabalhar em uma nova funcionalidade, o colaborador deve criar uma branch específica com:
- git checkout -b minha-nova-funcionalidade
- Isso evita alterações diretas na branch main e possibilita que as mudanças passem por revisão via Pull Request.

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

COMO SUBIR O PROJETO ATUALIZADO NO GITHUB COM BRANCHES E PULL REQUESTS

1. Verifique a pasta do projeto: No terminal do VS Code, navegue até a pasta do repositório clonado:
- cd nome-do-repositorio
2. Crie uma nova branch para suas alterações: É importante evitar alterar a branch main diretamente. Crie uma branch específica para a sua funcionalidade ou correção:
- git checkout -b nome-da-sua-branch
3. Substitua nome-da-sua-branch por um nome que descreva a alteração, como feature/login ou bugfix/corrige-header.
4. Verifique o status das alterações: Use o comando a seguir para ver os arquivos modificados:
- git status
- Os arquivos que ainda não foram adicionados ao commit aparecerão em vermelho, enquanto os que já estão prontos para commit ficam em verde.
5. Adicione os arquivos modificados, se quiser adicionar todas as alterações:
- git add .
- Ou, se preferir adicionar apenas arquivos específicos, por exemplo:
- git add src/App.js
6. Faça o commit das alterações: Sempre descreva as mudanças realizadas:
- git commit -m "Descrição das mudanças realizadas"
- Caso queria verificar novamente os arquivos, repare que após o commit, estarão verdes:
- git status
7. Envie (push) a nova branch para o GitHub: Em vez de enviar as alterações diretamente para a branch main, envie sua branch para o repositório remoto:
- git push origin nome-da-sua-branch
8. Abra um Pull Request no GitHub: Após o push, acesse o GitHub e crie um pull request da sua branch para a branch main. Por que isso é importante? O pull request permite que os demais membros do grupo revisem e comentem as alterações antes que elas sejam mescladas na branch principal, garantindo que o código permaneça seguro e de qualidade.
