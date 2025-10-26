import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, content, filename } = body || {}

    const doc = new PDFDocument({ size: 'A4', margin: 50 })

    const chunks: Uint8Array[] = []
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))

    const endPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks.map((c) => Buffer.from(c)))))
      doc.on('error', (err: any) => reject(err))
    })

    // Header
    doc.fontSize(14).font('Helvetica-Bold')
    if (title) {
      doc.text(title, { align: 'center' })
      doc.moveDown()
    }

    // Divider
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.options.margin, doc.y).strokeOpacity(0.1).stroke()
    doc.moveDown()

    // Body
    doc.fontSize(11).font('Helvetica')

    if (typeof content === 'string') {
      // Split into paragraphs and write with spacing
      const paragraphs = content.split('\n\n')
      paragraphs.forEach((p: string) => {
        doc.text(p.trim(), {
          align: 'left',
          lineGap: 4,
        })
        doc.moveDown(0.5)
      })
    }

    // Footer note
    doc.moveDown()
    doc.fontSize(9).fillColor('gray')
    doc.text('Este documento foi gerado pela plataforma AMPARA. Deve ser revisado e assinado por um profissional habilitado para ter validade legal.', {
      align: 'left',
    })

    doc.end()

    const pdfBuffer = await endPromise

    // Convert Buffer to Uint8Array for the response body
    const uint8 = Uint8Array.from(pdfBuffer)

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.length),
        'Content-Disposition': `attachment; filename="${filename || 'relatorio'}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Error generating PDF:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
