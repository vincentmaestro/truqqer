
export default function AuthInfo({ info }: {
    info: string
}) {
    return(
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{info}</p>
        </div>
    );
}
