// Sample 버튼용 SOAP 응답 — 네임스페이스, 속성, 반복 요소, 중첩 반복, xsi:nil, CDATA, 한글을 담았다
export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <ns:GetOrdersResponse xmlns:ns="http://example.com/orders">
      <ns:orders>
        <ns:order id="A-1001" status="paid">
          <ns:customer>Kim Minji</ns:customer>
          <ns:total currency="KRW">48000</ns:total>
          <ns:items>
            <ns:item sku="BK-01">Notebook</ns:item>
            <ns:item sku="PN-07">Pen</ns:item>
          </ns:items>
          <ns:memo xsi:nil="true"/>
        </ns:order>
        <ns:order id="A-1002" status="pending">
          <ns:customer>최지우</ns:customer>
          <ns:total currency="USD">19.99</ns:total>
          <ns:items>
            <ns:item sku="MG-02">Mug</ns:item>
          </ns:items>
          <ns:memo><![CDATA[Leave at the door | 문 앞에 두세요]]></ns:memo>
        </ns:order>
        <ns:order id="A-1003" status="cancelled">
          <ns:customer>Lee Jun</ns:customer>
          <ns:total currency="KRW">0</ns:total>
          <ns:items/>
          <ns:memo></ns:memo>
        </ns:order>
      </ns:orders>
    </ns:GetOrdersResponse>
  </soap:Body>
</soap:Envelope>
`;
