


# Algoritmos para Resolução das 8 Rainhas

- Abrir o arquivo 8Queens.html nos navegadores Chrome ou Firefox.

- Esta explicação supõe que você já tenha conhecimentos prévios sobre a abordagem dos algoritmos Hill Climbing, Genetic e CSP.

- Os algoritmos foram executados com o objetivo de colocar 8 rainhas em um tabuleiro 8 casas de largura por 8 de
comprimento não permitindo que elas se ataquem, os ataques podem acontecer na diagonal, vertical e horizonral.

- Estado: rainhas posicionas no tabuleiro.

- A função heuristica utilizada para determinar quais estados se aproximam da solução é a quantidade de pares de rainhas que se atacam.


### Hill Climbing (Subida de Encosta)

- Inicia-se com as rainhas embaralhadas por linha, cada rainha é posicionada em uma coluna e a linha onde ela deve estar posicionada é determinada aleatoriamente. 

- Utiliza-se função heurística local (verifica ataques de uma determinada rainha com as rainhas vizinhas) e heurística global (verifica ataques de todas as rainhas no tabuleiro).

- Na implementação é feita uma busca local calculando sempre a heurística local para uma determinada rainha. O
objetivo é obter as melhores heurísticas locais e comparar elas
com a heurística global, se tiver uma heurística local com menos ataques ou
igual a heurística global é feito a mudança de estado.

-Este procedimento se repete até que se obtenha heurística global igual a zero ou se a heuristica global depois de três
iterações permanecer igual, isto significa que pra todas as
rainhas o algoritmo chegou no máximo da sua busca local e
não conseguirá encontrar heurística local melhor que a atual,
portanto neste caso o algorimo finaliza com falha.

### Genetic (Genético)

- Um gene é definido como um estado do tabuleiro onde cada cromossomo corresponde a uma rainha e a sua posição.

- Cada rainha pertence a uma coluna do tabuleiro, portanto elas se movimentam nas linhas.

- Parametros definidos: 
    - 20% da população é selecionada para a evolução da proxima geração
    - São geradas 5 gerações portanto executadas 4 evoluções
    - Cada população corresponde a 800 individuos

-Inicia-se com o tabuleiro vazio, a primeira população é definida aleatoriamente, em seguida é
feito o cálculo da heurística para cada indivíduo e escolhido os 20% melhores (menor números de rainhas que se atacam),
é executado a evolução utilizando cruzamento e mutação.

    - Cruzamento: cada par de indivíduo é cruzado de 10 formas diferentes gerando sempre dois filhos, portanto cada
par de indivíduos geram 20 filhos.
    
    - Mutação: Troca a posição de dois e quatro genes escolhidos aleatorimente, cada indivíduo sofre duas mutações
gerando dois novos indivíduos.

- A partir dos novos indivíduos gerados pelo cruzamento e mutação é definido uma nova população e feito
novamente o procedimento de escolha dos melhores (20%) e a evolução para obter uma nova população melhor que a anterior.

- Este procedimento ocorre até a geração de uma população que possua um ou mais indivíduos onde sua heurística seja
zero (nenhuma rainha se ataca, estado final do problema), se ocorrer 5 gerações e nenhum individuo possuir função de heurística zero o algoritmo é finalizado com falha.


### CSP (PSR - Problema de Satisfação de Restrição)

- Inicia-se com o tabuleiro vazio, as rainhas são colocadas uma a uma seguindo as restrições:

    - Cada rainha deve estar em uma coluna do tabuleiro.
    - Rainha só pode se movimentar nas linhas do tabuleiro.
    - Rainha não pode atacar as rainhas que já foram colocadas no tabuleiro.
    - Rainha não pode ser colocada nas extremidades do tabuleiro.

- Ao definir uma posição para colocar uma rainha no tabuleiro, se ela não satisfazer as restrições ela não deve ser
colocada e o algoritmo deve voltar para a rainha colocada anteriormente (backtracking) e tentar posicionar ela em outra linha sempre
verificando as restrições.

-Este procedimento ocorre até que todas as rainhas estejam no tabuleiro e estejam satisfazendo todas as restrições (estado final do problema).


