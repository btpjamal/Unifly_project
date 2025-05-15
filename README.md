TODO LIST
- criar um mapa mental para acompanhar melhor a navegação entre as telas e suas funções
- criar um menu de estabelecimentos após o Login do cliente, esse menu deve listar todos os estabelecimentos registrados no banco de dados
- após o cliente selecionar um estabelecimento, ele será direcionado ao cardápio do mesmo
- o cardápio do estabelecimento é gerido pelo proprietário do mesmo, todos os produtos informados pelo proprietário na sua dashboard de proprietário, devem aparecer listados no cardapio do cliente

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

COMO BAIXAR (CLONAR) SEU PROJETO EM OUTRA MÁQUINA:

1. Instale o Git na outra máquina (se ainda não tiver):
https://git-scm.com/downloads
2. Abra o Visual Studio Code na nova máquina.
3. No VS Code, abra o terminal (atalho: Ctrl + `).
4. Vá até a pasta onde quer salvar o projeto:
cd caminho/da/pasta/destino
(ou ir até a pasta manualmente, pelo gerenciador de arquivos em "Open Folder" no canto superior esquerdo do seu VS Code)
5. No terminal, clone o repositório com o seguinte comando:
- git clone https://github.com/btpjamal/projetoFaculdade
6. Acesse a pasta clonada:
- cd projetoFaculdade
7. (Opcional) Instale as dependências do projeto:
Se for um projeto com Node.js, React, React Native, etc., você provavelmente precisa instalar as dependências com:
- npm install

COMO SUBIR O PROJETO ATUALIZADO NO GITHUB:
1. Verifique se está na pasta do projeto clonado:
No terminal do VS Code:
- cd nome-do-repositorio
2. Veja o status das alterações:
- git status
Você verá os arquivos modificados em vermelho (não adicionados ainda) ou verde (já prontos para commit).
3. Adicione os arquivos modificados:
Se quiser adicionar todos os arquivos alterados:
- git add .
Ou adicione apenas arquivos específicos, ex:
- git add src/App.js
4. Faça o commit das alterações:
- git commit -m "Descreva aqui o que você mudou"
5. Envie (push) as alterações para o GitHub:
- git push origin main
Pronto! O repositório do GitHub estará atualizado com suas novas alterações feitas na outra máquina.
