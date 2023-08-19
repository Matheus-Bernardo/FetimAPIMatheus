
'''
Script para cadastrar um novo usuario(diretório) e salvar as imagens obtidas no front(captura.html) no user novo

Desenvolvido por Matheus Henrique Lourenço Bernardo
gitHub: https://github.com/Matheus-Bernardo

'''
import shutil
import re
import os


#declaração de variaveis
novoUser = input("Digite seu nome: ")
pasta_pai = "labels"
nova_pasta = novoUser
downloads_path = os.path.join(os.path.expanduser("~"), "Downloads")
current_directory = os.getcwd()#pega caminho a partir desse arquivo
db_users_patch = current_directory + "\labels\\"+ nova_pasta


def create_dir():    
    #Mover fotos de downloads para as pastas de seus users em labels
    #pasta de acesso, pasta a ser criada
    caminho_completo = os.path.join(pasta_pai, nova_pasta)
    if not os.path.exists(caminho_completo):# Verifica se a pasta(user) já existe antes de criar
        os.mkdir(caminho_completo)
        print("Usuário(diretorio) cadastrado com sucesso.")
    else:
        print("usuario(diretorio) já existe.")


def move_capture():
    #task para mover foto baixada para pasta destino
    #regex para identificar nomeclatura no diretorio download
    padrao_nome = r'^captured_image(?: \(\d+\))?\.png$'  # Expressão regular para "captured_image", opcionalmente seguido por um número, com extensão ".png"
    arquivos_download = os.listdir(downloads_path)
    # Itera sobre os arquivos e move apenas os arquivos que correspondem ao padrão de nomeclatura
    for arquivo in arquivos_download:
        caminho_arquivo = os.path.join(downloads_path, arquivo)
        if os.path.isfile(caminho_arquivo) and re.match(padrao_nome, arquivo, re.IGNORECASE):
            novo_caminho = os.path.join(db_users_patch, arquivo)
            shutil.move(caminho_arquivo, novo_caminho)
            print(f"Arquivo {arquivo} movido para {db_users_patch}")


#renomeia para o padrao esperado pela api
def rename():
    
    arquivos_png = [arquivo for arquivo in os.listdir(db_users_patch) if arquivo.endswith(".png")]
    arquivos_png.sort()  # Ordena os arquivos .png

    contador = 1
    for nome_atual in arquivos_png:
        novo_nome = f"{contador:0d}.png"  # Formata o novo nome 
        caminho_atual = os.path.join(db_users_patch, nome_atual)
        caminho_novo = os.path.join(db_users_patch, novo_nome)
        os.rename(caminho_atual, caminho_novo)
        print(f"Arquivo {nome_atual} renomeado para {novo_nome}")
        contador += 1


create_dir()
move_capture()
rename()





