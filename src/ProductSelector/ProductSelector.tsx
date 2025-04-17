import React, { useState, useEffect } from "react";
import "./styles.css";

interface ProductVariant {
  id: number;
  product_id: number;
  price: string;
  values: string[];
  image_id?: number;
  inventory_quantity: number;
  image_url: string;
}

interface ProductImage {
  id: number;
  product_id: number;
  src: string;
}

interface ProductData {
  id: number;
  title: string;
  options: string[];
  values: string[][];
  variants: ProductVariant[];
  image_url: string;
  images?: ProductImage[];
}

const ProductSelector = () => {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(
          "https://empreender.nyc3.cdn.digitaloceanspaces.com/static/teste-prod-1.json"
        );
        const data: ProductData = await response.json();
        setProduct(data);

        // Inicializa as opções selecionadas com os primeiros valores disponíveis
        const initialOptions: Record<string, string> = {};
        data.options.forEach((option, index) => {
          if (data.values[index] && data.values[index].length > 0) {
            initialOptions[option] = data.values[index][0];
          }
        });
        setSelectedOptions(initialOptions);

        // Encontra a variante correspondente às opções iniciais
        findVariant(data, initialOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, []);

  const findVariant = (
    productData: ProductData,
    options: Record<string, string>
  ) => {
    const selectedValues = Object.values(options);
    const variant = productData.variants.find((v) =>
      v.values.every((value, index) => value === selectedValues[index])
    );
    setSelectedVariant(variant || null);
  };

  const handleOptionChange = (option: string, value: string) => {
    const newOptions = {
      ...selectedOptions,
      [option]: value,
    };
    setSelectedOptions(newOptions);
    if (product) {
      findVariant(product, newOptions);
    }
  };

  const handleBuyClick = () => {
    if (!selectedVariant) {
      alert("Por favor, selecione uma variante do produto");
      return;
    }

    if (selectedVariant.inventory_quantity <= 0) {
      alert("Produto sem estoque disponível");
      return;
    }

    // Simulação de compra bem-sucedida
    alert(
      `Compra realizada com sucesso!\n\nProduto: ${
        product?.title
      }\nVariante: ${selectedVariant.values.join(
        " - "
      )}\nPreço: R$ ${selectedVariant.price.replace(".", ",")}`
    );

    // Aqui você poderia adicionar a lógica real de compra (API call, etc.)
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!product) return <div>Produto não encontrado</div>;

  return (
    <div className="overlay-nuvem active carregou">
      <div className="modal-buybutton-nuvem">
        <div className="produto-imagem">
          <img
            loading="lazy"
            data-componente="imagem"
            src={selectedVariant?.image_url || product.image_url}
            alt={product.title}
          />
        </div>

        <div className="produto-desc" produto-id={product.id.toString()}>
          <div>
            <h1 className="produto-titulo" data-componente="titulo">
              {product.title}
            </h1>
          </div>

          <div className="produto-precos">
            {selectedVariant && (
              <p
                data-componente="comparado"
                className="produto-preco-comparado"
              >
                R$
                {parseFloat(selectedVariant.price).toFixed(2).replace(".", ",")}
              </p>
            )}
          </div>

          {/* Variantes */}
          <div className="produto-opts">
            <div className="produtos-variantes">
              {product.options.map((option, index) => {
                // Verifica se existem valores para esta opção
                if (
                  !product.values[index] ||
                  product.values[index].length === 0
                ) {
                  return null;
                }

                return (
                  <div key={`${option}-${index}`} className="produto-select">
                    <span>{option}:</span>
                    <select
                      value={selectedOptions[option] || ""}
                      onChange={(e) =>
                        handleOptionChange(option, e.target.value)
                      }
                    >
                      {product.values[index].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="produto-compra">
            <button
              className="btn-comprar btn"
              onClick={handleBuyClick}
              disabled={
                !selectedVariant || selectedVariant.inventory_quantity <= 0
              }
            >
              <div className="text-btn">
                {selectedVariant && selectedVariant.inventory_quantity <= 0
                  ? "Sem estoque"
                  : "Comprar"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
