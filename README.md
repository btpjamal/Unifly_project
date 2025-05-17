TODO LIST
- criar um mapa mental para acompanhar melhor a navegação entre as telas e suas funções
- criar um menu de estabelecimentos após o Login do cliente, esse menu deve listar todos os estabelecimentos registrados no banco de dados - OK
- após o cliente selecionar um estabelecimento, ele será direcionado ao cardápio do mesmo - OK
- o cardápio do estabelecimento é gerido pelo proprietário do mesmo, todos os produtos informados pelo proprietário na sua dashboard de proprietário, devem aparecer listados no cardapio do cliente - OK
- o fornecedor pode personalizar o seu cardapio com cores e temas da sua loja, para facilitar a vizualização do cliente em categorias - NECESSÁRIO DISCUTIR A IDÉIA
- barra de pesquiza para que os clientes possam pesquisar o estabelecimento e a categoria que ele quer buscar - VOU TENTAR FAZER DEPOIS (JAMAL)
- Testar todo o lado do cliente e análisar oque pode ser feito - PODE SER NECESSÁRIA UMA REUNIÃO PARA DISCUTIR IDÉIAS
- Terminar de incrementar as páginas e funcionalidades do lado do proprietáro - PODE SER NECESSÁRIA UMA REUNIÃO PARA DISCUTIR IDÉIAS

OQUE EU FIZ (JAMAL):
- Incrementei um header na "EstabelecimentosScreen" com botão para sair(fazer logout), titulo da página centralizado e botão de perfil
- Histórico de pedidos no perfil foi aprimorado, agora mostra o nome do estabelecimento, data registrada a partir do servidor do banco de dados (mais exata)
- A navegação entre o Dashboard do proprietário e o cardapio do proprietário agora está funcionando (necessário algumas revisões depois)
- Ao confirmar um pedido, o botão retorna ao menu de estabelecimentos



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

****Se quiser clonar e já começar em uma branch específica, você pode usar:
- git clone -b nome-da-branch https://github.com/btpjamal/projetoFaculdade
Isso já muda para essa branch após o clone.  
